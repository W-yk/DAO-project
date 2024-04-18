import React from "react";
import { ConnectWallet, useAddress, useContract, useDisconnect } from '@thirdweb-dev/react';

const Header = () => {
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  const [flyer, setFlyer] = React.useState(false);
  const [flyerTwo, setFlyerTwo] = React.useState(false);

  return (
    <header class="fixed top-0 w-full clearNav z-50">
      <div class="max-w-5xl mx-auto flex flex-wrap p-5 flex-col md:flex-row">
        <div className="flex flex-row items-center justify-between p-3 md:p-1">
          <img src="https://flowbite.com/docs/images/logo.svg" class="h-8" alt="Flowbite Logo" />          
          <button
            className="text-white pb-4 cursor-pointer leading-none px-3 py-1 md:hidden outline-none focus:outline-none content-end ml-auto"
            type="button"
            aria-label="button"
            onClick={() => setNavbarOpen(!navbarOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-menu"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
        <div
          className={
            "md:flex flex-grow items-center" +
            (navbarOpen ? " flex" : " hidden")
          }
        >
          
          <div class="md:ml-auto md:mr-auto font-4 pt-1 md:pl-14 pl-1 flex flex-wrap items-center md:text-base text-1xl md:justify-center justify-items-start">            
            <a class="mr-5 cursor-pointer text-gray-300 hover:text-white font-semibold tr04">
              Info
            </a>
            <a class="mr-5 cursor-pointer text-gray-300 hover:text-white font-semibold tr04">
            Statistics
            </a>
            <a class="mr-5 cursor-pointer text-gray-300 hover:text-white font-semibold tr04">
            Member List
            </a>
            
            <div className="relative">
              <button
                type="button"
                className="
                   group rounded-md text-gray-300 inline-flex items-center text-base font-medium focus:outline-none pb-8'
                  "
                onMouseEnter={() => (setFlyer(!flyer), setFlyerTwo(false))}
              >
                <span className="tr04">Proposals</span>
                <svg
                  className={
                    flyer === true
                      ? "transform rotate-180 ml-3 h-5 w-5 transition ease-out duration-200"
                      : "ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                  }
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div
                onMouseLeave={() => setFlyer(false)}
                className={
                  flyer
                    ? "opacity-100 translate-y-0 transition ease-out duration-200 absolute z-10 -ml-4 mt-3 g327 border transform px-2 w-screen max-w-sm sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2"
                    : "hidden opacity-0 translate-y-1 absolute z-10 -ml-4 mt-3 transform px-2 w-screen max-w-md sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2"
                }
              >
                <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                  <div className="relative grid gap-6 bg-black px-2 py-6 sm:gap-8 ">
                    <a
                      href="/"
                      className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-800 tr04"
                    >
                      <div className="ml-4">
                        <p className="text-base font-medium text-white">
                          Active
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Active Proposals
                        </p>
                      </div>
                    </a>
                    <a
                      href="/"
                      className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-800 tr04"
                    >
                      <div className="ml-4">
                        <p className="text-base font-medium text-white">
                          Ended
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          History Proposals
                        </p>
                      </div>
                    </a>                    
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ConnectWallet theme="light" />
        </div>
      </div>
    </header>
  );
}

export default Header;