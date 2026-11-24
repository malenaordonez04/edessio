import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import type { RootState } from "../app/store";
import { MdSend, MdChat } from "react-icons/md";

interface Message {
    _id?: string;
    sender: string;
    receiver: string;
    content: string;
    createdAt?: string;
}

interface Contact {
    _id: string;
    name: string;
    profilePicture?: string;
    role: string;
}

// 1. Declaramos las props que recibe desde ProfilePage
interface ChatTabProps {
    currentUserId?: string;
}

const ChatTab: React.FC<ChatTabProps> = ({ currentUserId }) => {
    const { token, user } = useSelector((state: RootState) => state.auth);
    // Usamos el ID del perfil cargado en ProfilePage o el de Redux como respaldo
    const myId = currentUserId || (user as any)?._id;

    const [socket, setSocket] = useState<Socket | null>(null);
    const [conversations, setConversations] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Conexión a Socket.io y registro de usuario
    useEffect(() => {
        if (!myId) return;
        const newSocket = io("http://localhost:5001");
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Conectado al socket de chat:", newSocket.id);
            newSocket.emit("register", myId);
        });

        newSocket.on("online_users", (users: string[]) => {
            setOnlineUsers(users)
        })
        return () => {
            newSocket.disconnect();
        };
    }, [myId]);

    // Cargar la lista de contactos + detectar si venimos de "Contactá al profesor"
    useEffect(() => {
        const fetchConversations = async () => {
            if (!token) return;
            try {
                const res = await axios.get("http://localhost:5001/api/messages/conversations", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                let chats: Contact[] = res.data;

                // 2. Revisamos si el usuario tocó "Contactá al profesor" en TutorProfilePage
                const pendingTutorId = localStorage.getItem("activeChatTutorId");
                if (pendingTutorId) {
                    localStorage.removeItem("activeChatTutorId");
                    const existingChat = chats.find((c) => c._id === pendingTutorId);

                    if (existingChat) {
                        setSelectedContact(existingChat);
                    } else {
                        const tutorRes = await axios.get(`http://localhost:5001/api/tutors/${pendingTutorId}`);
                        if (tutorRes.data) {
                            const newContact: Contact = {
                                _id: tutorRes.data._id,
                                name: tutorRes.data.name,
                                profilePicture: tutorRes.data.profilePicture,
                                role: "tutor"
                            };
                            chats = [newContact, ...chats];
                            setSelectedContact(newContact);
                        }
                    }
                } else if (chats.length > 0 && !selectedContact) {
                    setSelectedContact(chats[0]);
                }

                setConversations(chats);
            } catch (error) {
                console.error("Error al cargar conversaciones:", error);
            }
        };
        fetchConversations();
    }, [token]);

    // Cargar el historial de mensajes cuando seleccionamos un contacto
    useEffect(() => {
        const fetchMessages = async () => {
            if (!token || !selectedContact) return;
            try {
                const res = await axios.get(`http://localhost:5001/api/messages/${selectedContact._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(res.data);
            } catch (error) {
                console.error("Error al cargar historial de mensajes:", error);
            }
        };
        fetchMessages();
    }, [token, selectedContact]);

    // Escuchar mensajes entrantes en tiempo real por socket
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message: Message) => {
            if (
                selectedContact &&
                (message.sender === selectedContact._id || message.receiver === selectedContact._id)
            ) {
                setMessages((prev) => [...prev, message]);
            }
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [socket, selectedContact]);

    // Auto-scroll al final de los mensajes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Enviar mensaje
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact || !myId || !socket) return;

        const messageData = {
            sender: myId,
            receiver: selectedContact._id,
            content: newMessage.trim()
        };

        socket.emit("send_message", messageData);
        setNewMessage("");
    };

    const isSelectedContactOnline = selectedContact ? onlineUsers.includes(selectedContact._id) : false;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row h-[600px]">
            {/* Lista de contactos / conversaciones (Izquierda) */}
            <div className="w-full md:w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
                <div className="p-4 border-b border-gray-100 bg-white">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <MdChat className="text-primary" /> Mensajes
                    </h2>
                </div>

                <div className="overflow-y-auto flex-grow divide-y divide-gray-100">
                    {conversations.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-sm">
                            No tenés conversaciones activas todavía. Buscá un profesor y enviale un mensaje desde su perfil.
                        </div>
                    ) : (
                 conversations.map((contact) => {
                            const isOnline = onlineUsers.includes(contact._id);
                            return (
                                <button
                                    key={contact._id}
                                    onClick={() => setSelectedContact(contact)}
                                    className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${
                                        selectedContact?._id === contact._id
                                            ? "bg-blue-50/80 border-l-4 border-primary"
                                            : "hover:bg-gray-100/60 bg-white"
                                    }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={
                                                contact.profilePicture ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random`
                                            }
                                            alt={contact.name}
                                            className="h-11 w-11 rounded-full object-cover border border-gray-200"
                                        />
                                        <span
                                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                                                isOnline ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                        />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-gray-900 text-sm truncate">{contact.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {contact.role === "tutor" ? "Profesor" : "Estudiante"}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Ventana de chat principal (Derecha) */}
            <div className="w-full md:w-2/3 flex flex-col bg-white h-full">
                {selectedContact ? (
                    <>
                        {/* Cabecera del chat seleccionado */}
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white shadow-2xs">
                            <img
                                src={
                                    selectedContact.profilePicture ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedContact.name)}&background=random`
                                }
                                alt={selectedContact.name}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            />
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">{selectedContact.name}</h3>
                                {isSelectedContactOnline ? (
                                    <p className="text-xs text-green-600 font-medium flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                        En línea
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                                        Desconectado
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Listado de mensajes */}
                        <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-50/30">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-400 text-sm mt-20">
                                    Iniciá la conversación con {selectedContact.name} enviando un mensaje abajo.
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.sender === myId;
                                    return (
                                        <div
                                            key={msg._id || index}
                                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-2xs ${
                                                    isMe
                                                        ? "bg-primary text-white rounded-br-none"
                                                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                                                }`}
                                            >
                                                <p className="break-words">{msg.content}</p>
                                                <span
                                                    className={`block text-[10px] mt-1 text-right ${
                                                        isMe ? "text-blue-100" : "text-gray-400"
                                                    }`}
                                                >
                                                    {msg.createdAt
                                                        ? new Date(msg.createdAt).toLocaleTimeString([], {
                                                              hour: "2-digit",
                                                              minute: "2-digit"
                                                          })
                                                        : ""}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input para escribir mensaje */}
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white flex gap-2">
                            <input
                                type="text"
                                placeholder="Escribe un mensaje..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-grow px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                                type="submit"
                                aria-label="Enviar mensaje"
                                className="bg-primary text-white p-2.5 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center"
                            >
                                <MdSend className="h-5 w-5" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-gray-400 text-sm p-6 text-center">
                        Seleccioná una conversación de la izquierda para comenzar a chatear.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatTab;