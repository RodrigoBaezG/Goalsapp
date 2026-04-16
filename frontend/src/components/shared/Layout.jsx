import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import { Outlet } from "react-router-dom";
import LayoutCss from "./Layout.module.css";
import Aside from "./Aside.jsx";

function Layout({privateRoute}) {
    return (
        <>
            <Header></Header>
            <main className={LayoutCss.mainContainer}>
                {privateRoute && <Aside/>}
                <section className={LayoutCss.main}>
                    <Outlet></Outlet>
                </section>
            </main>
            <Footer></Footer>
        </>
    );
}

export default Layout;
