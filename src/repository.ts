import { ITestInterface2 } from "./functions/test-folder/test-nested-import-file";

export interface User extends ITestInterface2 {
    id: string;
    name: string;
    age: number;
}

export const users = [{
    id: '1000',
    name: 'Abigail',
    age: 10
}, {
    id: '2000',
    name: 'Bruno',
    age: 20
}]