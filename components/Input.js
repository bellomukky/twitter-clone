import { PhotographIcon, XIcon, ChartBarIcon, EmojiHappyIcon, CalendarIcon } from "@heroicons/react/outline";
import {useState,useRef} from 'react';
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

import app,{db, storage} from "../firebase";

import {addDoc,updateDoc,doc,collection,serverTimestamp} from "@firebase/firestore";

import {getDownloadURL,uploadString,ref} from "@firebase/storage";

import {useSession} from "next-auth/react";

function Input() {
    const [input, setInput] = useState("")
    const [selectedFile, setSelectedFile] = useState(null)
    const [showEmojis, setShowEmojis] = useState(false)
    const [loading,setLoading] = useState(false);
    const {data: session} = useSession();
    const addEmoji = (e) => {
        let sym = e.unified.split("-");
        let codesArray = [];
        sym.forEach((el) => codesArray.push("0x" + el));
        let emoji = String.fromCodePoint(...codesArray);
        setInput(input + emoji);
      };
    
    
    const photoRef = useRef();

    const addImageToPost = (e)=>{
        const filereader = new FileReader();
        if(e.target.files[0])
        {
            filereader.readAsDataURL(e.target.files[0])
        }

        filereader.onload = (readerEvent)=>{
            console.log(readerEvent.target.result)
            setSelectedFile(readerEvent.target.result)
        }
    }

    const sendPost = async ()=>{
        if(loading)
        return;
        setLoading(true);

       const postRef = await addDoc(collection(db,"posts"),{
            id: session.user.uid,
            username: session.user.name,
            userImg: session.user.image,
            tag: session.user.tag,
            text: input,
            timestamp: serverTimestamp(),
        });

        const storageRef = ref(storage,`posts/${postRef.id}/image`);
        if(selectedFile)
        {
            await uploadString(storageRef,selectedFile,"data_url").then(async()=>{
                const downloadURL = await getDownloadURL(storageRef)
                await updateDoc(doc(db,"posts",postRef.id),{
                    image : downloadURL
                })
            })
        }

        setLoading(false)
        setInput("")
        setShowEmojis(false);
        setSelectedFile(null);
    }
    return (
        <div className={`border-b border-gray-700 p-3 flex space-x-3 ${loading&&"opacity-60"}`}>
             <img 
                 src={session.user.image}
                 className="h-11 w-11 rounded-full cursor-pointer overflow-y-scroll"
                 />
                 <div className="w-full divide-y divide-gray-700">
                     <div className={`${selectedFile && "pb-7"} ${input && "py-2.5"}`}>
                         <textarea
                         value={input}
                         placeholder="What's happening?"
                         rows="2" className="w-full bg-transparent outline-none text-[#d9d9d9] 
                                    placeholder-gray-500 tracking-wide min-h-[50px]"
                                    onChange={(e)=>setInput(e.target.value)}
                                    />
                        {selectedFile && (
                        <div className="relative">
                            <div className="absolute w-8 h-8 flex items-center 
                                bg-opacity-75 hover:bg-[#272c26] bg-[#15181c]
                                justify-center rounded-full top-1 left-1 cursor-pointer"
                                onClick={()=>setSelectedFile(null)}
                                >
                                <XIcon className="text-white h-5" />
                            </div>
                            <img src={selectedFile} className="rounded-t-2xl 
                                max-h-80 object-contain " />
                        </div>
                        )}
                     </div>
                     {!loading &&(
                     <div className={"flex items-center justify-between pt-2.5"}>
                        <div className="flex items-center ">
                            <div className="icon">
                                <PhotographIcon onClick={()=>photoRef.current.click()} className="h-[22px] text-[#1d9bf0]" />
                                <input type="file" hidden onChange={addImageToPost} ref={photoRef} />
                            </div>
                            <div className="icon rotate-90">
                                <ChartBarIcon className="text-[#1d9bf0] h-[22px]" />
                            </div>

                            <div className="icon" onClick={() => setShowEmojis(!showEmojis)}>
                                <EmojiHappyIcon className="text-[#1d9bf0] h-[22px]" />
                            </div>

                            <div className="icon">
                                <CalendarIcon className="text-[#1d9bf0] h-[22px]" />
                            </div>


                            {showEmojis && (
                                <Picker
                                onSelect={addEmoji}
                                style={{
                                    position: "absolute",
                                    marginTop: "465px",
                                    marginLeft: -40,
                                    maxWidth: "320px",
                                    borderRadius: "20px",
                                }}
                                theme="dark"
                                />
                            )}
                        </div>
                        <button className="rounded-full bg-[#1d9bf0] text-white px-4 py-1.5 font-bold
                        shadow-md hover:bg-[#1a8cd8] disabled:hover:bg-[#1d9bf0] disabled:opacity-50
                        disabled:cursor-default
                        " disabled={!input.trim() && !selectedFile}
                        onClick={sendPost}
                        >Tweet</button>
                     </div>
                     )}
                    
                 </div>
        </div>
    )
}

export default Input
