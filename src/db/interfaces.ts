// class interfaces

export interface IUsers {
    createUser(ln: string, usn: string, pwd: string, refer: string, ...args: any): Promise<string>
    getUser(ln: string): Promise<UserProps>
}

export interface IRefers {
    createRefer(uid: number, link: string, ...args: any): Promise<boolean>
    getRefer(link: string): Promise<ReferProps>
    isValid(link: string): Promise<boolean>
    useRefer(link: string): Promise<boolean>
    setReferUses(link: string, uses: number): Promise<boolean>
}

export interface ISessions {
    login(ln: string, pwd: string, salt: string): Promise<string>
}

// result interfaces
export interface ReferProps {
    id: number,
    uid: number,
    uses: number,
    max_uses: number,
    link: string
}

export interface UserProps {
    id: number,
    login_name: string,
    user_name: string,
    tag: string,
    pwd_hash: string,
    pgp: string | null
    rank: number,
    created: Date,
    refer: string,
    pfp_url: string,
    bio: string | null
}