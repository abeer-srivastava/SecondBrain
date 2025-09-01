import {BrowserRouter, Routes, Route} from "react-router-dom"
import Page from "./components/pages/Page"
import Signup from "./components/pages/Signup"
import Signin from "./components/pages/Signin"
import SharedBrainView from "./components/pages/SharedBrainView"
import LandingPage from "./components/pages/LandingPage"
import SearchPage from "./components/pages/SearchPage"


function App() {
  return (
<BrowserRouter>
<Routes>
  <Route path="/" element={<LandingPage/>}></Route>
  <Route path="/page" element={<Page/>}></Route>
  <Route path="/search" element={<SearchPage/>}></Route>
  <Route path="/signup" element={<Signup/>}></Route>
  <Route path="/signin" element={<Signin/>}></Route>
  <Route path="/share/:shareId" element={<SharedBrainView/>}></Route>
</Routes>
</BrowserRouter>
  )

}
 
export default App