import type React from "react";
import { useState } from "react";
import { Bot, Eye, EyeOff } from "lucide-react";

interface AuthScreenProps {
  onLogin: () => void;
  darkMode: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  darkMode,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username && password) {
      setIsLoading(true);
      setTimeout(() => {
        onLogin();
      }, 800);
    }
  };

  return (
    <div
      className={`h-full w-full flex items-center justify-center ${
        darkMode ? "bg-[#0f0f0f]" : "bg-gray-100"
      }`}
    >
      <div
        className={`w-full max-w-[400px] p-10 rounded-2xl shadow-xl flex flex-col items-center animate-login ${
          darkMode ? "bg-[#1c1c1d] text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="w-32 h-32 rounded-full flex items-center justify-center mb-6 bg-[#3390ec]">
          <Bot className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Sign in</h1>
        <p
          className={`text-center mb-8 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Please enter your username and password.
        </p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="relative group">
            <input
              type="text"
              id="username"
              className={`peer w-full border rounded-xl px-4 pt-5 pb-2 outline-none transition-colors ${
                darkMode
                  ? "bg-transparent border-gray-600 focus:border-[#3390ec]"
                  : "bg-transparent border-gray-300 focus:border-[#3390ec]"
              }`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label
              htmlFor="username"
              className={`absolute left-4 top-3.5 text-gray-500 text-base transition-all duration-200 peer-focus:text-xs peer-focus:top-1 peer-focus:text-[#3390ec] ${
                username ? "text-xs top-1" : ""
              }`}
            >
              Username
            </label>
          </div>
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className={`peer w-full border rounded-xl px-4 pt-5 pb-2 pr-10 outline-none transition-colors ${
                darkMode
                  ? "bg-transparent border-gray-600 focus:border-[#3390ec]"
                  : "bg-transparent border-gray-300 focus:border-[#3390ec]"
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label
              htmlFor="password"
              className={`absolute left-4 top-3.5 text-gray-500 text-base transition-all duration-200 peer-focus:text-xs peer-focus:top-1 peer-focus:text-[#3390ec] ${
                password ? "text-xs top-1" : ""
              }`}
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-4 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-bold text-white transition-transform active:scale-95 flex justify-center items-center ${
              isLoading ? "opacity-80" : ""
            }`}
            style={{ backgroundColor: "#3390ec" }}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Log In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
