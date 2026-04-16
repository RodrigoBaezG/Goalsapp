import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import Layout from "./components/shared/Layout.jsx";
import List from "./components/private/list/List.jsx";
import Details from "./components/private/new/Details.jsx";
import NotFound from "./components/shared/NotFound.jsx";
import Modal from "./components/shared/Modal.jsx";
import Access from "./components/public/access/Access.jsx";
import Register from "./components/public/register/Register.jsx";
import Authenticate from "./components/shared/Authenticate.jsx";

function App() {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/access" element={<Access />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
            </Route>
            <Route element={<Layout privateRoute />}>
                <Route element={<Authenticate />}>
                    <Route index element={<List />} />
                    <Route path="/list" element={<List />}>
                        <Route
                            path="/list/:id"
                            element={
                                <Modal onClose={() => navigate('/list')}>
                                    <Details />
                                </Modal>
                            }
                        />
                    </Route>
                    <Route path="/create" element={<Details />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
