import AuthForm from "../../components/AuthForm";

export const metadata = {
  title: "Create account | HealthMate",
};

export default function SignupPage() {
  return <AuthForm mode="register" />;
}
