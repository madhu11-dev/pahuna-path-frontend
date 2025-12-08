import { useEffect, useRef, useState } from 'react';
import UserSidebar from '../../components/user/UserSidebar';
import UserNavbar from '../../components/user/UserNavbar';
import { getUserProfileApi, updateUserProfileApi, updateUserPasswordApi } from '../../apis/Api';
import { ToastContainer, toast } from 'react-toastify';
import { IMAGE_PLACEHOLDER, resolveImageUrl } from '../../utils/media';

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [pictureFile, setPictureFile] = useState(null);
  const fileInputRef = useRef(null);

  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getUserProfileApi();
        const data = res?.data ?? res;
        if (data) {
          setProfile(data);
          setForm({ name: data.name || '', email: data.email || '' });
        } else {
          // Fallback to cookies set on login
          const name = getCookie('user_name');
          const email = getCookie('user_email');
          const picture = getCookie('user_profile_picture');
          setProfile({ name, email, profile_picture_url: picture });
          setForm({ name: name || '', email: email || '' });
        }
      } catch (err) {
        // Fallback to cookies
        const name = getCookie('user_name');
        const email = getCookie('user_email');
        const picture = getCookie('user_profile_picture');
        setProfile({ name, email, profile_picture_url: picture });
        setForm({ name: name || '', email: email || '' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setPictureFile(f);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      // If there's a picture file, use multipart/form-data. Otherwise send JSON to avoid multipart+PATCH issues.
      if (pictureFile) {
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('profile_picture', pictureFile);
        // updateUserProfileApi will convert FormData to POST with _method=PATCH
        res = await updateUserProfileApi(formData);
      } else {
        // send JSON payload
        const payload = { name: form.name };
        res = await updateUserProfileApi(payload);
      }
      const updated = res?.data ?? res;
      setProfile(updated || { ...profile, name: form.name });
      // Update cookies if backend returns updated values
      if (updated?.name) document.cookie = `user_name=${updated.name}; path=/; max-age=${24*60*60}`;
      if (updated?.profile_picture_url) document.cookie = `user_profile_picture=${updated.profile_picture_url}; path=/; max-age=${24*60*60}`;
      toast.success('Profile updated successfully');
      setEditing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setPictureFile(null);
    } catch (err) {
      console.error('Profile update failed', err);
      const msg = err?.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      toast.error('New password and confirmation do not match');
      return;
    }
    setPwdSubmitting(true);
    try {
      const payload = { current_password: pwdForm.current_password, new_password: pwdForm.new_password };
      await updateUserPasswordApi(payload);
      toast.success('Password updated successfully');
      setPwdForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      console.error('Password update failed', err);
      const msg = err?.response?.data?.message || 'Failed to update password';
      toast.error(msg);
    } finally {
      setPwdSubmitting(false);
    }
  };

  const imageUrl = profile?.profile_picture_url ? resolveImageUrl(profile.profile_picture_url) : IMAGE_PLACEHOLDER;

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />

      <div className="flex pt-20">
        <UserSidebar active="profile" />

        <main className="ml-64 flex-1 px-8 py-6 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Profile</h2>

          {loading ? (
            <div className="p-6 bg-white rounded-lg shadow-sm">Loading profile...</div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex gap-6 items-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100">
                    <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{profile?.name}</h3>
                    <p className="text-sm text-gray-600">{profile?.email}</p>
                    <p className="text-sm text-gray-500 mt-2">Manage your profile details and password</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-4">Edit Profile</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full name</label>
                    <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Profile picture</label>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Save changes</button>
                    <button type="button" onClick={() => { setForm({ name: profile?.name || '', email: profile?.email || '' }); setPictureFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="px-4 py-2 border rounded-lg">Cancel</button>
                  </div>
                </div>
              </form>

              <form onSubmit={handlePasswordSubmit} className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-4">Change Password</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Current password</label>
                    <input type="password" value={pwdForm.current_password} onChange={(e) => setPwdForm({...pwdForm, current_password: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">New password</label>
                    <input type="password" value={pwdForm.new_password} onChange={(e) => setPwdForm({...pwdForm, new_password: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Confirm new password</label>
                    <input type="password" value={pwdForm.confirm_password} onChange={(e) => setPwdForm({...pwdForm, confirm_password: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={pwdSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Update password</button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Profile;
