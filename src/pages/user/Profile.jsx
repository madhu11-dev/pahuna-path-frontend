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
  const [form, setForm] = useState({ name: '', email: '' });
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getUserProfileApi();
        const data = res?.data ?? res;
        setProfile(data);
        setForm({ name: data.name || '', email: data.email || '' });
      } catch (err) {
        console.error('Failed to load profile:', err);
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

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (picturePreview) {
        URL.revokeObjectURL(picturePreview);
      }
    };
  }, [picturePreview]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setPictureFile(f);
      setPicturePreview(URL.createObjectURL(f));
    }
  };

  const removePicture = () => {
    setPictureFile(null);
    setPicturePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      if (pictureFile) {
        formData.append('profile_picture', pictureFile);
      }
      
      const res = await updateUserProfileApi(formData);
      const updated = res?.data ?? res;
      setProfile(updated);
      
      if (updated?.name) document.cookie = `user_name=${updated.name}; path=/; max-age=${24*60*60}`;
      if (updated?.profile_picture_url) document.cookie = `user_profile_picture=${updated.profile_picture_url}; path=/; max-age=${24*60*60}`;
      
      toast.success('Profile updated successfully');
      setPictureFile(null);
      setPicturePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Profile update failed', err);
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const newPw = pwdForm.new_password.trim();
    const confirmPw = pwdForm.confirm_password.trim();

    if (!newPw) {
      toast.error('New password cannot be empty');
      return;
    }

    if (newPw !== confirmPw) {
      toast.error('Passwords do not match');
      return;
    }

    setPwdSubmitting(true);
    try {
      await updateUserPasswordApi({ 
        current_password: pwdForm.current_password, 
        new_password: newPw, 
        new_password_confirmation: confirmPw 
      });
      toast.success('Password updated successfully');
      setPwdForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      console.error('Password update failed', err);
      toast.error(err?.response?.data?.message || 'Failed to update password');
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
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Profile picture</label>
                    {picturePreview && (
                      <div className="mb-3 relative inline-block">
                        <img src={picturePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200" />
                        <button
                          type="button"
                          onClick={removePicture}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input ref={fileInputRef} id="profile-pic-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      <label htmlFor="profile-pic-upload" className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition-colors text-sm">
                        {pictureFile ? 'Change Photo' : 'Choose Photo'}
                      </label>
                      {pictureFile && (
                        <span className="text-sm text-gray-600">{pictureFile.name}</span>
                      )}
                    </div>
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
                    <button type="submit" disabled={pwdSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">Update password</button>
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
