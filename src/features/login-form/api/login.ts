const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const login = async (e: React.SubmitEvent<HTMLFormElement>, loginData: { username: string; password: string; }) => {
    e.preventDefault()
    try {
        const res = await fetch(BACKEND_URL + '/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(loginData)
        })

        const result = await res.json() 
        console.log('result: ', result);
        
        return result
    } catch (error) {
        console.error('Error login: ', error);
    }
}

