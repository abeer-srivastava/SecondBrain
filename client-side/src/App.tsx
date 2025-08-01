import {BrowserRouter, Routes, Route} from "react-router-dom"
import Page from "./components/pages/Page"
import Signup from "./components/pages/Signup"
import Signin from "./components/pages/Signin"
import SharedBrainView from "./components/pages/SharedBrainView"


function App() {
  return (
<BrowserRouter>
<Routes>
  <Route path="/" element={<Page/>}></Route>
  <Route path="/signup" element={<Signup/>}></Route>
  <Route path="/signin" element={<Signin/>}></Route>
  <Route path="/shared/:shareId" element={<SharedBrainView/>}></Route>
</Routes>
</BrowserRouter>
  )

}
 
export default App