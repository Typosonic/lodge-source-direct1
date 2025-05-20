
import Layout from "@/components/layout/Layout";
import AuthForm from "@/components/auth/AuthForm";

const Auth = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 max-w-xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient">Access Your Account</span>
            </h1>
            <p className="text-white/70 text-lg mb-6">
              Sign in to your 1:1 Lodge account to access exclusive products, manage orders, and track your balance.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-lodge-purple/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lodge-purple">🔒</span>
                </div>
                <div>
                  <h3 className="font-medium">Secure Platform</h3>
                  <p className="text-white/60 text-sm">End-to-end encryption and secure authentication protocols</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-lodge-purple/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lodge-purple">💼</span>
                </div>
                <div>
                  <h3 className="font-medium">Business Dashboard</h3>
                  <p className="text-white/60 text-sm">Comprehensive tools to manage your reselling business</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-lodge-purple/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lodge-purple">🌐</span>
                </div>
                <div>
                  <h3 className="font-medium">Global Network</h3>
                  <p className="text-white/60 text-sm">Connect with trusted suppliers worldwide</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md">
            <AuthForm />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
