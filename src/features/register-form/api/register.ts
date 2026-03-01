const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const register = async (e: React.SubmitEvent<HTMLFormElement>, registerData: any) => {
    e.preventDefault()
    try {
        console.log('registerData = ', registerData);
        
        const res = await fetch(BACKEND_URL + '/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        })

        const result = await res.json() 
        console.log(result);
        
        return result
    } catch (error) {
        console.error('Error login: ', error);
    }
}

