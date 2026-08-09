import type {
  ChannelMessage
} from "./message";

import type {
  Signal
} from "./signal";


export function convertMessageToSignal(
  message: ChannelMessage
): Signal {


  return {

    id:
      `signal-${message.id}`,

    channel:
      message.channel,

    status:
      "received",

    content:
      message.content,

    receivedAt:
      message.receivedAt,

    metadata:{
      sender:
        message.sender ?? ""
    }

  };

}