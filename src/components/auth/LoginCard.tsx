import { useState } from "react";
import { login, register } from "@/firebase/authService";
import { acceptInvite } from "@/firebase/inviteService";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginCard() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [inviteCode, setInviteCode] = useState("");

    async function handleSubmit() {
        if (!email.trim() || !password.trim()) return;

        try {
            const userCredential = isRegistering
                ? await register(email.trim(), password)
                : await login(email.trim(), password);

            const user = userCredential.user;

            if (inviteCode.trim()) {
                await acceptInvite(
                    inviteCode.trim(),
                    user.uid,
                    user.email ?? ""
                );
            }
        } catch (error) {
            console.error("Auth failed:", error);
            alert("Login failed. Check console.");
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isRegistering ? "Create Account" : "Login"}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit();
                    }}
                />

                <Input
                    placeholder="Invite code for kids only"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit();
                    }}
                />

                <Button className="w-full" onClick={handleSubmit}>
                    {isRegistering ? "Create Account" : "Login"}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsRegistering((current) => !current)}
                >
                    {isRegistering
                        ? "Already have an account? Login"
                        : "Need an account? Create one"}
                </Button>
            </CardContent>
        </Card>
    );
}