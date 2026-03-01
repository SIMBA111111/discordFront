import { Dispatch, SetStateAction } from "react";

export const handleLoginFormData = (e: React.ChangeEvent<HTMLInputElement>, field: string, setLoginData: Dispatch<SetStateAction<{ username: string; password: string; }>>) => {
    setLoginData((prev: any) => (
        {
            ...prev,
            [field]: e.target.value,
        }
    ))
}