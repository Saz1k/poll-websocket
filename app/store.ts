import { create } from "zustand";

type pollStore = {
	question : string
	description : string
	options: string[]
    setPoll: (data:{question:string;description:string,options:string[]})=>void
}

export const usePollStore = create<pollStore>((set)=>({
    question:'',
    description:'',
    options:[],
    setPoll:(data)=> set({
        question:data.question,
        description:data.description,
        options:data.options
    })
}))