import { create } from "zustand";

type optionStore = {
	optionIds : number[]
}

export const usePollStore = create<optionStore>((set)=>({
    optionIds:[]
}))