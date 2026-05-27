// class interfaces

export interface IUsers {
    createUser(ln: string, usn: string, pwd: string, refer: string, ...args: any): Promise<string>
}

export interface IRefers {
    createRefer(uid: number, link: string, ...args: any): Promise<boolean>
}

// result interfaces
export interface ReferProps {
    id: number,
    uid: number,
    uses: number,
    max_uses: number,
    link: string
}