// users interfaces

export interface IUsers {
    createUser(ln: string, usn: string, pwd: string, refer: string, ...args: any): Promise<string>
}