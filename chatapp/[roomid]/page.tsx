"use client";

import Navbar from "@/components/navbar";
import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

// const socket = io("http://localhost:4000/");
const socket = io("https://chatserver-q3gi.onrender.com/");

interface Message {
  username: string;
  message: string;
  sentByCurrentUser?: boolean;
  timestamp: string;
  room: string;
  online: number;
}

export default function Page({ params }: { params: { roomid: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [send, setSend] = useState("");
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState(params.roomid);
  const [online, setOnline] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      setOnline(message.online);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    socket.on("getonlineuser", (onlineuserdata) => {
      setOnline(onlineuserdata);
    });

    return () => {
      socket.off("getonlineuser");
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (send.trim() !== "" && username.trim() !== "" && room.trim() !== "") {
      const timestamp = getCurrentTime();
      const message: Message = {
        username,
        message: send,
        timestamp,
        room,
        online,
      };
      socket.emit("message", message);
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...message, sentByCurrentUser: true },
      ]);
      setSend("");
    }
  }

  function handleJoinRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (username.trim() !== "" && room.trim() !== "") {
      socket.emit("getonlineuser", { room, online });
      socket.emit("join", { username, room });
      setUsername(username);
      setRoom(room);
    }
  }

  // const handleCopyText = async () => {
  //   if (navigator.clipboard) {
  //     navigator.clipboard.writeText(room);
  //   } else {
  //     const textArea = document.createElement("textarea");
  //     textArea.value = room;
  //     document.body.appendChild(textArea);
  //     textArea.select();
  //     document.execCommand("copy");
  //     document.body.removeChild(textArea);
  //     // openWhatsApp(room);
  //   }
  // };

  const openWhatsApp = () => {
    const encodedText = encodeURIComponent(
      `https://personal-chat-ashen.vercel.app/${params.roomid}`
    );
    const whatsappDesktopUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappDesktopUrl, "_blank");
  };

  const handleCopyRoomid = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(room);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = room;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  return (
    <>
      <div className="flex flex-col h-[100vh] bg-transparent p-4">
        <h1 className="font-extrabold font-font-font-sans text-4xl sm:text-xl mb-2 text-center text-violet-100">
          Private Chat ( {online} Users Online)
        </h1>
        <div className="flex sm:flex-col flex-grow overflow-hidden">
          <div className="flex flex-col w-3/4 sm:h-[75vh] border-r sm:border-0 border-gray-500 sm:w-full ">
            <div
              ref={chatContainerRef}
              className="flex-grow overflow-y-scroll px-4 sm:px-2 py-2 scrolleffect "
            >
              <ul className="space-y-4 ">
                {messages.map((messageObj, index) => (
                  <li
                    key={index}
                    className={`p-[14px] px-6 flex sm:flex  sm:px-4 sm:py-2 h-fit gap-2 items-center justify-evenly rounded-3xl  ${
                      messageObj.sentByCurrentUser
                        ? "bg-purple-700 text-right min-w-[10rem] sm:min-w-[5rem]  max-w-fit ml-auto"
                        : "bg-red-600 text-left min-w-[10rem] sm:min-w-[5rem] max-w-fit mr-auto"
                    }`}
                  >
                    <span className=" text-gray-200 sm:text-[16px] sm:font-mono ">
                      {messageObj.username} :
                    </span>
                    <pre className="text-white text-xl sm:text-[16px] sm:font-serif sm:font-light font-bold text-wrap auto-cols-max overflow-hidden">
                      {messageObj.message}
                    </pre>
                  </li>
                ))}
              </ul>
            </div>
            <form onSubmit={handleSubmit} className="bg-transparent ">
              <input
                className="text-white text-lg sm:w-[75%] sm:py-[5px] mt-2 sm:pl-4 bg-transparent border border-white focus:outline-none placeholder-gray-600 py-4 px-10 rounded-full w-[75%] sm:rounded-xl"
                type="text"
                value={send}
                onChange={(e) => setSend(e.target.value)}
                placeholder="Type your message"
              />
              <button
                className="text-white sm:text-[17px] tracking-widest font-mono sm:border-2 sm:border-white sm:text-center sm:w-[20%] text-2xl font-extrabold bg-green-600 border-2 border-white hover:bg-black hover:text-white hover:border-green-600 rounded-full sm:rounded-md px-10 sm:p-1 py-3 ml-4 w-[20%] sm:text-white"
                type="submit"
              >
                Send
              </button>
            </form>
          </div>
          <div className="flex flex-col sm:w-[100%] w-[25%] bg-transparent p-4   sm:flex-row sm:justify-between ">
            <form
              onSubmit={handleJoinRoom}
              className="flex flex-col space-y-4 sm:flex-row  my-auto sm:gap-5  "
            >
              <input
                className="sm:hidden text-white text-lg bg-transparent border border-gray-300 focus:outline-none placeholder-gray-400 py-2 px-4 sm:rounded-md sm:w-48 sm:pl-2 sm:p-1  rounded-full sm:h-10 "
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your Username"
              />
              {/* sm */}
              <input
                className="sm:visible 2xl:hidden text-white text-lg bg-transparent border border-gray-300 focus:outline-none placeholder-gray-400  px-4 sm:rounded-md sm:w-[15rem] sm:pl-2 sm:p-1  rounded-full sm:h-10 "
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
              <button
                className="text-white font-mono text-xl sm:text-[18px] font-extrabold bg-blue-600 border-2 border-wihte hover:bg-black hover:border-blue-600 hover:text-white rounded-full py-2 sm:rounded-md sm:w-20 sm:h-10 sm:text-white tracking-widest"
                type="submit"
              >
                Join
              </button>

              <button
                className="text-white sm:hidden font-mono text-xl sm:text-[18px] font-extrabold bg-pink-600 border-2 border-white hover:bg-black hover:border-pink-600 hover:text-white rounded-full py-2 sm:rounded-md sm:w-20 sm:h-10 sm:text-white tracking-widest"
                onClick={openWhatsApp}
              >
                What`s App Share
              </button>
              <button
                className="text-white sm:hidden font-mono text-xl sm:text-[18px] font-extrabold bg-yellow-700 border-2 border-white hover:bg-black hover:border-pink-600 hover:text-white rounded-full py-2 sm:rounded-md sm:w-20 sm:h-10 sm:text-white tracking-widest"
                onClick={handleCopyRoomid}
              >
                Copy Room ID
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
