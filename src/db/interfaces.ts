// users interfaces

export interface IUsers {
    createUser(ln: string, usn: string, pwd: string, refer: string, ...args: any): Promise<string>
}

export interface IRefers {
    createRefer(uid: number, link: string, ...args: any): Promise<boolean>
}