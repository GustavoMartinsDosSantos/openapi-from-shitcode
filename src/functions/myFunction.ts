import { users } from "../repository";

console.log('Hello world mamaco');

interface MyFunctionParams {
    personId: string;
}

interface MyFunctionReturn {
    age: number;
    name: string;
    id: string;
}

export const myFunction = async ({personId}: MyFunctionParams): Promise<MyFunctionReturn | []> => {
    return new Promise((resolve, reject) => {
        const foundUser = users.find(user => user.id === personId)
        resolve(foundUser || [])
    })
}