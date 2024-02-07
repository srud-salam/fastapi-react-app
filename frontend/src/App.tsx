import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { PrivateRoute } from "./components/private-route/PrivateRoute";
import { Layout } from "./components/layout/Layout";

import Home from "./pages/home/Home";
import SignUp from "./pages/signup/Signup";
import ProductForm from "./pages/product-form/ProductForm";
import PageNotFound from "./pages/page-not-found/PageNotFound";
import ProductSummary from "./pages/product-summary/ProductSummary";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            {/* public routes */}
            <Route path="/" element={<Home />} />
            <Route path="signup" element={<SignUp />} />

            {/* private routes */}
            <Route element={<PrivateRoute />}>
              <Route path="product-form" element={<ProductForm />} />
              <Route path="product-summary" element={<ProductSummary />} />
            </Route>

            {/* exception routes */}
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
