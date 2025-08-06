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
}

export const useWebSocket = ({
  postId,
  onCommentCreated,
  onCommentUpdated,
  onCommentDeleted,
}: UseWebSocketProps) => {
  const stompClient = useRef<any>(null);
  const connected = useRef(false);
  const subscriptionRef = useRef<any>(null);

  const connect = useCallback(() => {
    
    try {
      const socket = new SockJS('http://localhost:9000/ws');
      
      stompClient.current = Stomp.over(socket);
      
      stompClient.current.debug = () => {};

      stompClient.current.connect(
        {},
        () => {
          connected.current = true;

          if (stompClient.current && stompClient.current.connected) {
            const subscription = `/topic/post/${postId}/comments`;
            
            try {
              subscriptionRef.current = stompClient.current.subscribe(
                subscription,
                (message: any) => {
                  try {
                    const response: WebSocketMessage = JSON.parse(message.body);
                    
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
                    }
                  } catch (error) {
                  }
                },
                (error: any) => {
                }
              );
            } catch (error) {
            }
          } else {
          }
        },
        (error: any) => {
          connected.current = false;
          
          // Retry connection after 5 seconds
          setTimeout(() => {
            if (!connected.current) {
              connect();
            }
          }, 100);
        }
      );
    } catch (error) {
    }
  }, [postId, onCommentCreated, onCommentUpdated, onCommentDeleted]);

  const disconnect = useCallback(() => {
    try {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      
      if (stompClient.current && connected.current) {
        stompClient.current.disconnect();
        connected.current = false;
      }
    } catch (error) {
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, postId]);

  return { connected: connected.current };
}; 