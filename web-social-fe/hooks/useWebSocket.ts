// import { useEffect, useRef, useCallback } from 'react';
// import SockJS from 'sockjs-client';
// import { Stomp } from '@stomp/stompjs';

// interface WebSocketMessage {
//   type: string;
//   data: any;
//   message: string;
//   success: boolean;
// }

// interface UseWebSocketProps {
//   postId: number;
//   onCommentCreated?: (comment: any) => void;
//   onCommentUpdated?: (comment: any) => void;
//   onCommentDeleted?: (commentId: number) => void;
// }

// export const useWebSocket = ({
//   postId,
//   onCommentCreated,
//   onCommentUpdated,
//   onCommentDeleted,
// }: UseWebSocketProps) => {
//   const stompClient = useRef<any>(null);
//   const connected = useRef(false);
//   const subscriptionRef = useRef<any>(null);

//   const connect = useCallback(() => {
    
//     try {
//       const socket = new SockJS('http://localhost:9000/ws');
      
//       stompClient.current = Stomp.over(socket);
      
//       stompClient.current.debug = () => {};

//       stompClient.current.connect(
//         {},
//         () => {
//           connected.current = true;

//           if (stompClient.current && stompClient.current.connected) {
//             const subscription = `/topic/post/${postId}/comments`;
            
//             try {
//               subscriptionRef.current = stompClient.current.subscribe(
//                 subscription,
//                 (message: any) => {
//                   try {
//                     const response: WebSocketMessage = JSON.parse(message.body);
                    
//                     switch (response.type) {
//                       case 'COMMENT_CREATED':
//                         onCommentCreated?.(response.data.comment);
//                         break;
//                       case 'COMMENT_UPDATED':
//                         onCommentUpdated?.(response.data.comment);
//                         break;
//                       case 'COMMENT_DELETED':
//                         onCommentDeleted?.(response.data.comment?.id);
//                         break;
//                       default:
//                     }
//                   } catch (error) {
//                   }
//                 },
//                 (error: any) => {
//                 }
//               );
//             } catch (error) {
//             }
//           } else {
//           }
//         },
//         (error: any) => {
//           connected.current = false;
          
//           // Retry connection after 5 seconds
//           setTimeout(() => {
//             if (!connected.current) {
//               connect();
//             }
//           }, 100);
//         }
//       );
//     } catch (error) {
//     }
//   }, [postId, onCommentCreated, onCommentUpdated, onCommentDeleted]);

//   const disconnect = useCallback(() => {
//     try {
//       if (subscriptionRef.current) {
//         subscriptionRef.current.unsubscribe();
//         subscriptionRef.current = null;
//       }
      
//       if (stompClient.current && connected.current) {
//         stompClient.current.disconnect();
//         connected.current = false;
//       }
//     } catch (error) {
//     }
//   }, []);

//   useEffect(() => {
//     connect();

//     return () => {
//       disconnect();
//     };
//   }, [connect, disconnect, postId]);

//   return { connected: connected.current };
// }; 

import { useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

interface WebSocketMessage {
  type: string;
  data: any;
  message: string;
  success: boolean;
}

interface UseWebSocketProps {
  postId: number;
  onCommentCreated?: (comment: any) => void;
  onCommentUpdated?: (comment: any) => void;
  onCommentDeleted?: (commentId: number) => void;
  enabled?: boolean; // Thêm prop để control khi nào connect
}

export const useWebSocket = ({
  postId,
  onCommentCreated,
  onCommentUpdated,
  onCommentDeleted,
  enabled = true,
}: UseWebSocketProps) => {
  const stompClient = useRef<any>(null);
  const connected = useRef(false);
  const subscriptionRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!enabled || connected.current) return;

    try {
      const socket = new SockJS('http://localhost:9000/ws');
      stompClient.current = Stomp.over(socket);
      
      // Disable debug logs in production
      stompClient.current.debug = process.env.NODE_ENV === 'development' ? console.log : () => {};

      stompClient.current.connect(
        {},
        () => {
          console.log('✅ WebSocket connected for post:', postId);
          connected.current = true;
          
          if (stompClient.current && stompClient.current.connected) {
            const subscription = `/topic/post/${postId}/comments`;
            
            try {
              subscriptionRef.current = stompClient.current.subscribe(
                subscription,
                (message: any) => {
                  try {
                    const response: WebSocketMessage = JSON.parse(message.body);
                    console.log('📨 Received WebSocket message:', response);
                    
                    if (response.success) {
                      switch (response.type) {
                        case 'COMMENT_CREATED':
                          onCommentCreated?.(response.data.comment);
                          break;
                        case 'COMMENT_UPDATED':
                          onCommentUpdated?.(response.data.comment);
                          break;
                        case 'COMMENT_DELETED':
                          onCommentDeleted?.(response.data.comment?.id);
                          break;
                        default:
                          console.log('Unknown message type:', response.type);
                      }
                    }
                  } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                  }
                },
                (error: any) => {
                  console.error('WebSocket subscription error:', error);
                }
              );
              console.log('📡 Subscribed to:', subscription);
            } catch (error) {
              console.error('Error subscribing to WebSocket:', error);
            }
          }
        },
        (error: any) => {
          console.error('❌ WebSocket connection error:', error);
          connected.current = false;
          
          // Clear any existing timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          // Retry connection after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!connected.current && enabled) {
              console.log('🔄 Retrying WebSocket connection...');
              connect();
            }
          }, 3000);
        }
      );
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [postId, onCommentCreated, onCommentUpdated, onCommentDeleted, enabled]);

  const disconnect = useCallback(() => {
    try {
      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
        console.log('📡 Unsubscribed from WebSocket');
      }
      
      if (stompClient.current && connected.current) {
        stompClient.current.disconnect();
        connected.current = false;
        console.log('❌ WebSocket disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting WebSocket:', error);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, enabled]);

  return { 
    connected: connected.current,
    connect,
    disconnect
  };
};
