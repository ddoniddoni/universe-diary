import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().trim().email("올바른 이메일 주소를 입력해주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다.").max(72),
  nickname: z.string().trim().min(2, "닉네임은 2자 이상이어야 합니다.").max(20, "닉네임은 20자 이하여야 합니다."),
});

export const loginSchema = signupSchema.pick({ email: true, password: true });

export const authFormSchema = z.object({
  email: z.string().trim().email("이메일 주소를 다시 확인해주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 해요. 지금보다 조금만 더 길게 만들어주세요.").max(72),
  nickname: z.string().trim().min(2, "닉네임은 2자 이상으로 입력해주세요.").max(20, "닉네임은 20자 이하로 입력해주세요.").optional(),
});
