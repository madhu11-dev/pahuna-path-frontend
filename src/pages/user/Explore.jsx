import UserSidebar from '../../components/user/UserSidebar';
import UserNavbar from '../../components/user/UserNavbar';
import { ToastContainer } from "react-toastify";

const Explore = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <UserNavbar />

            <div className="flex pt-20">
                <UserSidebar active="explore" />
                <main className="ml-64 flex-1 px-8 py-6 max-w-4xl mx-auto">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore</h2>
                        <p className="text-gray-600">Find localized, not crowdy places hidden gems that even locals don't know of and also find hotels and restaruatns to stay and eat at one place. (coming soon).</p>
                    </div>

                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                        <p className="text-gray-600">
                            voila, the developers were too lazy and decided to rewrite this page next week. .. ... ..... ........ ............. ..................... ..................................
                        </p>
                    </div>
                </main>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Explore;


