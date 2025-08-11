import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
import Cookies from 'js-cookie';


const handler = NextAuth({
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret : process.env.GOOGLE_CLIENT_SECRET, 
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        const { email, image } = user;
        Cookies.set("profilePhoto", image);
        try { 
          const login = await fetch("http://appointment.paruluniversity.ac.in/back/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email
            }),
          });
          if (login.status === 200) {
            const token = await response.json().then((data) => { return data.token });
            Cookies.set("token", token)
          }
        }
        catch (error) {
          console.log(error)
        }
        return user
      }
      return user
    },
    async session({ session, token }) {
      // Add the profile photo URL to the session object
      if (token.picture) {
        session.user.image = token.picture;
      }
      return session;
    }
  }
});
export { handler as GET, handler as POST }


