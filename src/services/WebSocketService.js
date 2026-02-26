class WebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectInterval = 30*1000; // 5 секунд
        this.reconnectTimer = null;
        this.messageHandlers = [];
        this.isManualClose = false;
    }

    connect() {
        // Определяем WebSocket URL на основе текущего протокола
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/api/message/reception`;

        try {
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('WebSocket подключен');
                // Сбрасываем таймер переподключения при успешном подключении
                if (this.reconnectTimer) {
                    clearTimeout(this.reconnectTimer);
                    this.reconnectTimer = null;
                }
            };

            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('Получено сообщение через WebSocket:', message);
                    
                    // Вызываем все зарегистрированные обработчики
                    this.messageHandlers.forEach(handler => {
                        handler(message);
                    });
                } catch (error) {
                    console.error('Ошибка парсинга WebSocket сообщения:', error);
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket ошибка:', error);
            };

            this.socket.onclose = (event) => {
                console.log('WebSocket закрыт', event.code, event.reason);
                this.socket = null;
                
                // Автоматическое переподключение, если закрытие не было ручным
                if (!this.isManualClose) {
                    this.scheduleReconnect();
                }
            };
        } catch (error) {
            console.error('Ошибка создания WebSocket:', error);
            this.scheduleReconnect();
        }
    }

    scheduleReconnect() {
        if (this.reconnectTimer) {
            return; // Уже запланировано переподключение
        }

        console.log(`Переподключение через ${this.reconnectInterval / 1000} секунд...`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, this.reconnectInterval);
    }

    disconnect() {
        this.isManualClose = true;
        
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    // Регистрация обработчика сообщений
    onMessage(handler) {
        if (typeof handler === 'function') {
            this.messageHandlers.push(handler);
        }
    }

    // Удаление обработчика сообщений
    offMessage(handler) {
        const index = this.messageHandlers.indexOf(handler);
        if (index > -1) {
            this.messageHandlers.splice(index, 1);
        }
    }

    // Отправка сообщения (если понадобится)
    send(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket не подключен');
        }
    }
}

// Создаем единственный экземпляр (singleton)
export const webSocketService = new WebSocketService();
