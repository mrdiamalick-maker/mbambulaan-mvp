export interface ExternalEvent {

  id: string;


  provider: string;


  type: string;


  payload: Record<string, unknown>;


  receivedAt: string;

}



export function createExternalEvent(
  provider:string,
  type:string,
  payload:Record<string,unknown>
): ExternalEvent {


  return {

    id:
      `external-${Date.now()}`,

    provider,

    type,

    payload,

    receivedAt:
      new Date().toISOString()

  };

}