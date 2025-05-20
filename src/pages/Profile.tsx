import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input, AddressAutocomplete } from "@/components/ui/input";
import { GradientButton } from "@/components/ui/gradient-button";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [shipping, setShipping] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      supabase
        .from("profiles")
        .select("full_name,username,shipping_address")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setFullName(data.full_name || "");
            setUsername(data.username || "");
            setShipping(data.shipping_address || "");
          }
        });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: fullName, username, shipping_address: shipping })
        .eq("id", user.id);
      if (updateError) {
        setError("Failed to update profile.");
        toast.error("Failed to update profile.");
      } else {
        setSuccess("Profile updated successfully.");
        toast.success("Profile updated successfully.");
      }
    } catch (err) {
      setError("Unexpected error updating profile.");
      toast.error("Unexpected error updating profile.");
    }
    setLoading(false);
  };

  const handleChangeEmail = async () => {
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) {
        setError("Failed to update email.");
        toast.error("Failed to update email.");
      } else {
        setSuccess("Email update requested. Please check your inbox.");
        toast.success("Email updated successfully.");
      }
    } catch (err) {
      setError("Unexpected error updating email.");
      toast.error("Unexpected error updating email.");
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setSuccess("");
    setError("");
    if (!currentPassword || !newPassword) {
      setError("Please enter your current and new password.");
      setLoading(false);
      return;
    }
    // Supabase does not require current password for update, but you may want to re-authenticate in production
    const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
    if (pwError) {
      setError("Failed to update password.");
    } else {
      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto py-12 px-4">
        <h1 className="font-orbitron text-3xl md:text-4xl font-bold mb-8 text-center">My Profile</h1>
        <div className="space-y-6 bg-lodge-card-bg border border-white/10 rounded-xl p-6">
          <div>
            <label className="block text-white/80 mb-1 font-orbitron">Full Name</label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" />
          </div>
          <div>
            <label className="block text-white/80 mb-1 font-orbitron">Username</label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
          </div>
          <div>
            <label className="block text-white/80 mb-1 font-orbitron">Email</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" />
            <GradientButton className="mt-2 w-full" onClick={handleChangeEmail} disabled={loading}>Update Email</GradientButton>
          </div>
          <div>
            <label className="block text-white/80 mb-1 font-orbitron">Shipping Address</label>
            <AddressAutocomplete
              value={shipping}
              onChange={val => setShipping(val)}
              placeholder="Shipping Address"
              className="bg-lodge-dark-bg border-white/10"
            />
          </div>
          <GradientButton className="w-full" onClick={handleSave} disabled={loading}>Save Profile</GradientButton>
          <div className="pt-4 border-t border-white/10">
            <label className="block text-white/80 mb-1 font-orbitron">Change Password</label>
            <Input value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current Password" type="password" className="mb-2" />
            <Input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" type="password" className="mb-2" />
            <GradientButton className="w-full" onClick={handleChangePassword} disabled={loading}>Update Password</GradientButton>
          </div>
          {success && <div className="text-green-400 text-center font-medium mt-2">{success}</div>}
          {error && <div className="text-red-400 text-center font-medium mt-2">{error}</div>}
        </div>
      </div>
    </Layout>
  );
} 