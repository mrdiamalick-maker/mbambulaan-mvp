import type { Signal } from "./signal";


export interface ChannelAdapter {

  name: string;

  receive(
    payload: unknown
  ): Promise<Signal>;

  send(
    recipient: string,
    message: string
  ): Promise<boolean>;

}