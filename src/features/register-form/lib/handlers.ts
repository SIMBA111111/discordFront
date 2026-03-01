import { Dispatch, SetStateAction } from "react";

export const handleRegisterFormData = (e: React.ChangeEvent<HTMLInputElement>, field: string, setRegisterData: Dispatch<SetStateAction<any>>) => {
    setRegisterData((prev: any) => (
        {
            ...prev,
            [field]: e.target.value,
        }
    ))
}