import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import { Outlet } from "react-router-dom";
import LayoutCss from "./Layout.module.css";
import Aside from "./Aside.jsx";

function Layout({ privateRoute }) {
    return (
        <>
            <Header />
            <main className={LayoutCss.mainContainer}>
                {privateRoute && <Aside />}
                <section className={LayoutCss.main}>
                    <div className={privateRoute ? LayoutCss.mainInner : ""}>
                        <Outlet />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default Layout;
