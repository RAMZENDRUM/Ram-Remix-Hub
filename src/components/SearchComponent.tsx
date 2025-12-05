import React from "react";
import { Search } from "lucide-react";

const SearchComponent = () => {
    return (
        <div className="relative flex items-center justify-center">
            <div className="absolute z-[-1] w-full h-min-screen" />
            <div id="poda" className="relative flex items-center justify-center group">
                {/* Outer neon layers - Reduced size and fully rounded */}
                <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[50px] max-w-[260px] rounded-full blur-[3px]
                        before:absolute before:content-[''] before:z-[-2] before:w-full before:h-full before:bg-no-repeat
                        before:bg-[linear-gradient(to_right,#a855f7,#ec4899,#06b6d4)]" />

                {/* Inner layers - Fully rounded */}
                <div className="absolute z-[-1] overflow-hidden h-[96%] w-[96%] rounded-full blur-[3px] bg-black" />
                <div className="absolute z-[-1] overflow-hidden h-[94%] w-[94%] rounded-full blur-[3px] bg-[#010201]" />

                <div id="main" className="relative group flex items-center">
                    <input
                        placeholder="Search..."
                        type="text"
                        name="text"
                        className="bg-[#010201] border-none w-[200px] md:w-[250px] h-[42px] rounded-full text-white pl-[45px] pr-6 text-sm focus:outline-none placeholder-gray-400"
                    />

                    {/* Search Icon Container */}
                    <div className="absolute left-0 top-0 h-full w-[45px] flex items-center justify-center pointer-events-none">
                        <Search className="text-white/50 group-focus-within:text-[#cf30aa] transition-colors duration-300" size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchComponent;
