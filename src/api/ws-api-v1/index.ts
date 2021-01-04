import { Request, Router } from "express";
import { BehaviorSubject, interval, Observable, Subject, timer } from "rxjs";
import { filter, take, takeUntil, tap, timeout } from "rxjs/operators";
import * as WebSocket from "ws";
import { User, UserSession } from "../../models";
import { AuthenticationError } from "../../services/authentication.service/authentication.error";
import { AuthenticationService } from "../../services/authentication.service/authentication.service";
import { EventService } from "../../services/event.service";
import { LogService } from "../../services/log.service";
import { Authentication, Common, ErrorCodes, Message, MessageStub } from "./dto";
import { WsApiError } from "./dto/error";
import { EventMessage } from "./dto/event-message";

const AUTHENTICATION_TIMEOUT = 5000;
const KEEPALIVE_INTERVAL = 15000;
const KEEPALIVE_TIMEOUT = KEEPALIVE_INTERVAL * 5;

export type ClientState = "pending" | "ready" | "closed";

export class ClientHandler {
    public session: UserSession;
    public user: User;

    private log = LogService.instance;
    private ws: WebSocket;
    private lastActivity: Date;
    private internalState$: BehaviorSubject<ClientState> = new BehaviorSubject("pending" as ClientState);
    private internalReceive$: Subject<Message> = new Subject();

    public get state$(): Observable<ClientState> {
        return this.internalState$.pipe();
    }

    public get close$(): Observable<ClientState> {
        return this.state$.pipe(filter(state => state === "closed"));
    }

    public get incoming$(): Observable<Message> {
        return this.internalReceive$.pipe(
            takeUntil(this.close$),
            filter(message => !/^(?:authentication|common)/.test(message.type))
        );
    }
    
    constructor(ws: WebSocket, req: Request, private authentication: AuthenticationService) {
        this.ws = ws;
        this.lastActivity = new Date();

        /* process incoming messages */
        this.ws.on("message", data => {
            let parsed: Message;
            try {
                parsed = JSON.parse(data.toString());
                this.internalReceive$.next(parsed);
                this.lastActivity = new Date();
            } catch (error) {
                this.internalReceive$.error(new WsApiError("Failed to parse incoming message", ErrorCodes.MessageParseFailed));
            }
        });

        /* process socket errors */
        this.ws.on("error", error => {
            this.log.warn("remote error: " + error.message);
            this.internalReceive$.error(null);
        });

        /* process socket closure */
        this.ws.on("close", _ => {
            if (!this.internalReceive$.isStopped) {
                this.log.info("connection closed by remote");
                this.internalReceive$.complete();
            } else {
                this.log.info("connection closed");
            }
        });

        this.log.info("new connection opened");

        /* authentication timeout */
        timer(AUTHENTICATION_TIMEOUT).pipe(
            takeUntil(this.close$),
            filter(_ => this.internalState$.value !== "ready"),
            tap(_ => {
                this.log.warn(`client did not authenticate within ${AUTHENTICATION_TIMEOUT}ms - dropping`);
                this.internalReceive$.error(new WsApiError("Authentication timeout", ErrorCodes.AuthenticationTimeout));
            })
        ).subscribe();

        /* idle timeout && keepalive */
        interval(KEEPALIVE_INTERVAL).pipe(
            takeUntil(this.close$),
            filter(_ => this.internalState$.value !== "pending"),
            filter(_ => new Date().getTime() - this.lastActivity.getTime() >= KEEPALIVE_INTERVAL),
            tap(_ => this.send<Common.KeepaliveDto>({ type: "common.keepalive" })),
            filter(_ => new Date().getTime() - this.lastActivity.getTime() >= KEEPALIVE_TIMEOUT),
            tap(_ => this.close(new WsApiError("Idle timeout", ErrorCodes.IdleTimeout)))
        ).subscribe();

        /* propagate errors and closures */
        this.internalReceive$.subscribe({
            error: error => this.close(error || undefined),
            complete: () => this.close()
        });

        /* authentication */
        this.internalReceive$.pipe(
            takeUntil(this.close$),
            filter(message => message.type === "authentication.request"),
            tap(message => this.handleAuthenticationRequest(message as Authentication.RequestDto))
        ).subscribe();
    }

    /**
     * Sends a message to remote client without waiting for response.
     *
     * @param message message to be sent to client
     */
    public async send<T extends Message>(message: MessageStub<T>): Promise<void>{
        if (this.ws.readyState !== WebSocket.OPEN) {
            throw new WsApiError("Cannot transmit message on closed socket");
        }
        if (!message.sequenceId) {
            message.sequenceId = this.newSequenceId();
        }
        const serialized = JSON.stringify(message);
        this.ws.send(serialized);
    }

    private async handleAuthenticationRequest(request: Authentication.RequestDto): Promise<void> {
        try {
            if (request.sessionToken) {
                const session = await this.authentication.getSessionByToken(request.sessionToken);
                if (session) {
                    this.session = session;
                    this.user = this.session.user.user;
                    const response: Authentication.ResponseDto = {
                        type: "authentication.response",
                        sequenceId: request.sequenceId,
                        status: "ok"
                    };
                    await this.send(response);
                    this.internalState$.next("ready");
                    this.log.info("successfully authenticated using pre-existing session %s", session.id);
                } else {
                    return this.close(new WsApiError("Authentication failed", ErrorCodes.AuthenticationFailed, request.sequenceId));
                }
            } else {
                return this.close(new WsApiError("Bad request", ErrorCodes.BadRequest, request.sequenceId));
            }
        } catch (error) {
            if (error instanceof AuthenticationError) {
                return this.close(new WsApiError(error.message, error.code, request.sequenceId));
            } else {
                this.log.warn(error);
                return this.close(new WsApiError("Unknown error occurred", null, request.sequenceId));
            }
        }
    }

    /**
     * Closes the WebSocket API client handler and optionally transfers an error to client (if the connection is still open).
     *
     * @param error error to be reported to client
     */
    private close(error?: WsApiError): void {
        if (error && this.ws.readyState === WebSocket.OPEN) {
            const errorMessage: Common.ErrorMessageDto = {
                type: "common.error",
                sequenceId: error.sequenceId || this.newSequenceId(),
                errorCode: error.code || null,
                errorMessage: error.message
            };
            this.ws.send(JSON.stringify(errorMessage));
        }
        this.ws.close();
        this.internalState$.next("closed");
    }

    private newSequenceId(): string {
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
}

export class WsApiV1 {

    private log = LogService.instance;
    private handlers: ClientHandler[] = [];

    constructor(private auth: AuthenticationService, private eventBus: EventService) {
        this.eventBus.listen().subscribe(ev => this.handlers.forEach(h => h.send<EventMessage>({
            type: "event",
            action: ev.action,
            object: ev.object,
            objectType: ev.objectType
        })));
    }

    public get router(): Router {
        const router = Router();

        router.ws("/", (ws, req) => {
            const handler = new ClientHandler(ws,req,this.auth);
            handler.close$.pipe(take(1)).subscribe(() => this.handlers.splice(this.handlers.indexOf(handler),1))
            this.handlers.push(handler);
        });

        return router;
    }
}
