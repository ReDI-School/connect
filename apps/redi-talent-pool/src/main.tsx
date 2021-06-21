import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
// import i18n (needs to be bundled ;))
import './services/i18n/i18n'
import './main.scss'
// Needed for datepicker in <LogMentoringSessionDialog>

// uncomment this to see wasted/unnecessary renders of your components
// if (process.env.NODE_ENV !== 'production') {
// const whyDidYouRender = require('@welldone-software/why-did-you-render');
// whyDidYouRender(React, {include: [/.*/]});
// }

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

console.log(
  'This ReDI Connect build is configured for location: ',
  process.env.NX_REDI_CONNECT_REDI_LOCATION
)
