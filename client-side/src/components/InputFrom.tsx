
interface InputInterFace{
    placeholder:string,
    content:string,
    onChange:()=>void
}

export const InputFrom=({placeholder,content,onChange}:InputInterFace)=>{


    return (
        <>
        <label htmlFor="">{content}</label>
        <input type="text" placeholder={placeholder} onChange={onChange} className="py-4 px-2 m-2 border-2 rounded-md "/>
        </>

    )
}