import { DotsHorizontalIcon,TrashIcon,ShareIcon,
     SwitchHorizontalIcon,ChartBarIcon,ChatIcon, HeartIcon} from "@heroicons/react/outline"
import {HeartIcon as HeartIconFilled} from "@heroicons/react/solid"
import { useSession } from "next-auth/react";

import Moment from "react-moment";
import {useEffect,useState} from "react";
import { useRecoilState } from "recoil";
import {modalState,postIdState} from "../atom/modalAtom";
import { collection, onSnapshot, orderBy, query,deleteDoc,doc, setDoc } from "@firebase/firestore";

import {db} from '../firebase';

import {useRouter} from "next/router";
import { async } from "@firebase/util";

function Post({postPage,id,post}) {
    const {data:session} = useSession();
    const [comments,setComments] = useState([])
    const [likes,setLikes] = useState([])
    const [liked,setLiked] = useState(true)
    const [isOpen, setIsOpen] = useRecoilState(modalState)
    const [postId, setPostId] = useRecoilState(postIdState)

    const router = useRouter();
 
    useEffect(() => 
    onSnapshot(query(collection(db,`posts`,id,'comments'),
    orderBy("timestamp","desc")),(snapshot)=>{
        setComments(snapshot.docs)
    }), [db])

     useEffect(() => 
    onSnapshot(query(collection(db,`posts`,id,'likes'),
    orderBy("timestamp","desc")),(snapshot)=>{
        setLikes(snapshot.docs)
    }), [db,id])

    useEffect(() => setLiked(likes.findIndex((like)=>like.id===session?.user?.uid)!== -1),[likes])

    const likePost = async ()=>
    {
        if(liked)
        {
            await deleteDoc(doc(db,"posts",id,"likes",session.user.uid))
        }else{
            await setDoc(doc(db,"posts",id,"likes",session.user.uid),
            {username:session.user.name})
        }
        setLiked(!liked);
    }
    return (
        <div onClick={()=>router.push(`/${id}`)} className="p-3 flex cursor-pointer border-b border-gray-700">
            {
                !postPage && (
                    <img src={post?.userImg} className="h-10 w-10 rounded-full mr-4" />
                )
            }
            <div className="flex flex-col space-y-2 w-full">
                <div className={`flex ${!postPage && "justify-between"}`}>
                {
                    postPage && (
                        <img alt="Profile Pic" src={post?.userImg} className="h-10 w-10 rounded-full mr-4" />
                    )
                 }
                 <div className={`text-[#6e767d]`}>
                    <div className="inline-block group">
                        <h4 className={`text-[#d9d9d9] 
                        font-bold text-[15px] sm:text-base group-hover:underline ${!postPage && "inline-block"}`}>
                            {post?.username}
                        </h4>
                        <span className={`text-sm sm:text-[15px] ${!postPage && "ml-1.5"}`}>
                            @{post?.tag}
                        </span>
                    </div>{" "}
                    .{" "}
                    <span className={`hover:underline text-sm sm:text-[15px]`}>
                        <Moment fromNow>{post?.timestamp?.toDate()}</Moment>
                    </span>
                    {!postPage && (
                        <p className={`text-[#d9d9d9] text-[15px] sm:text-base mt-0.5`}>{post?.text}</p>
                    )}
                 </div>
                 <div className={`icon group flex flex-shrink-0 ml-auto `}>
                     <DotsHorizontalIcon className={`h-5 text-[#6e767d] group-hover:text-[#1d9bf0]`} />
                 </div>
                </div>
                {postPage && (
                        <p className={`text-[#d9d9d9] text-[15px] sm:text-base mt-0.5`}>{post?.text}</p>
                    )}
                    {
                        post?.image && (
                            <img src={post?.image} alt={post?.text} className="max-h-[750px] object-cover 
                            rounded-t-2xl " />
                        )
                    }
                    <div className={`text-[#6e767d] flex justify-between w-10/12 ${postPage && "mx-auto"}`}>

                    <div
            className="flex items-center space-x-1 group"
            onClick={(e) => {
              e.stopPropagation();
              setPostId(id);
              setIsOpen(true);
            }}
          >
            <div className="icon group-hover:bg-[#1d9bf0] group-hover:bg-opacity-10">
              <ChatIcon className="h-5 group-hover:text-[#1d9bf0]" />
            </div>
            {comments.length > 0 && (
              <span className="group-hover:text-[#1d9bf0] text-sm">
                {comments.length}
              </span>
            )}
          </div>

          {session.user.uid === post?.id ? (
            <div
              className="flex items-center space-x-1 group"
              onClick={(e) => {
                e.stopPropagation();
                deleteDoc(doc(db, "posts", id));
                router.push("/");
              }}
            >
              <div className="icon group-hover:bg-red-600/10">
                <TrashIcon className="h-5 group-hover:text-red-600" />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1 group">
              <div className="icon group-hover:bg-green-500/10">
                <SwitchHorizontalIcon className="h-5 group-hover:text-green-500" />
              </div>
            </div>
          )}

          <div
            className="flex items-center space-x-1 group"
            onClick={(e) => {
              e.stopPropagation();
              likePost();
            }}
          >
            <div className="icon group-hover:bg-pink-600/10">
              {liked ? (
                <HeartIconFilled className="h-5 text-pink-600" />
              ) : (
                <HeartIcon className="h-5 group-hover:text-pink-600" />
              )}
            </div>
            {likes.length > 0 && (
              <span
                className={`group-hover:text-pink-600 text-sm ${
                  liked && "text-pink-600"
                }`}
              >
                {likes.length}
              </span>
            )}
          </div>

          <div className="icon group">
            <ShareIcon className="h-5 group-hover:text-[#1d9bf0]" />
          </div>
          <div className="icon group">
            <ChartBarIcon className="h-5 group-hover:text-[#1d9bf0]" />
          </div>
        </div>
                   
            </div>
        </div>
    )
}

export default Post
