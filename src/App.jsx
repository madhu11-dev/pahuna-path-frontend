import { Route, Routes } from 'react-router-dom';
import Loginpage from "./pages/auth/Loginpage";

const App = () => {
  return (
    <>
        <Routes>
          <Route path="/login" element={<Loginpage />} />
        </Routes>
    </>
  )
}

export default App