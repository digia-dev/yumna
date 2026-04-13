export declare enum UserRole {
    KEPALA_KELUARGA = "KEPALA_KELUARGA",
    ISTRI = "ISTRI",
    ANAK = "ANAK"
}
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
}
export declare class LoginDto {
    email: string;
    password: string;
}
