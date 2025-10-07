const CalendarBox = () => {
  return (
    <>
      <div className="w-full max-w-full rounded-[10px] bg-white shadow-1">
        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-7 rounded-t-[10px] bg-primary text-white">
              <th className="flex h-15 items-center justify-center rounded-tl-[10px] p-1 text-body-xs font-semibold sm:text-base xl:p-5">
                <span className="hidden lg:block"> Sunday </span>
                <span className="block lg:hidden"> Sun </span>
              </th>
              <th className="flex h-15 items-center justify-center p-1 text-body-xs font-semibold sm:text-base xl:p-5">
                <span className="hidden lg:block"> Monday </span>
                <span className="block lg:hidden"> Mon </span>
              </th>
              <th className="flex h-15 items-center justify-center p-1 text-body-xs font-semibold sm:text-base xl:p-5">
                <span className="hidden lg:block"> Tuesday </span>
                <span className="block lg:hidden"> Tue </span>
              </th>
              <th className="flex h-15 items-center justify-center p-1 text-body-xs font-semibold sm:text-base xl:p-5">
                <span className="hidden lg:block"> Wednesday </span>
                <span className="block lg:hidden"> Wed </span>
              </th>
              <th className="flex h-15 items-center justify-center p-1 text-body-xs font-semibold sm:text-base xl:p-5">
                <span className="hidden lg:block"> Thursday </span>
                <span className="block lg:hidden"> Thur </span>
              </th>
              <th className="flex h-15 items-center justify-center p-1 text-body-xs font-semibold sm:text-base xl:p-5">
                <span className="hidden lg:block"> Friday </span>
                <span className="block lg:hidden"> Fri </span>
              </th>
              <th className="flex h-15 items-center justify-center rounded-tr-[10px] p-1 text-body-xs font-semibold sm:text-base xl:p-5">
                <span className="hidden lg:block"> Saturday </span>
                <span className="block lg:hidden"> Sat </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Line 1 */}
            <tr className="grid grid-cols-7">
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-semibold text-slate-900">1</span>
                <div className="group h-16 w-full flex-grow cursor-pointer py-1 md:h-30">
                  <span className="group-hover:text-primary md:hidden">
                    More
                  </span>
                  <div className="event invisible absolute left-2 z-99 mb-1 flex w-[200%] flex-col rounded-r-[5px] border-l-[3px] border-primary bg-gray-2 px-3 py-1 text-left opacity-0 group-hover:visible group-hover:opacity-100 md:visible md:w-[190%] md:opacity-100">
                    <span className="event-name font-semibold text-slate-900">
                      Redesign Website
                    </span>
                    <span className="time text-sm">1 Dec - 2 Dec</span>
                  </div>
                </div>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">2</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">3</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">4</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">5</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">6</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">7</span>
              </td>
            </tr>
            
            {/* Line 2 */}
            <tr className="grid grid-cols-7">
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">8</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">9</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">10</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">11</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">12</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">13</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">14</span>
              </td>
            </tr>
            
            {/* Line 3 */}
            <tr className="grid grid-cols-7">
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">15</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">16</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">17</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">18</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">19</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">20</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">21</span>
              </td>
            </tr>
            
            {/* Line 4 */}
            <tr className="grid grid-cols-7">
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">22</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">23</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">24</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">25</span>
                <div className="group h-16 w-full flex-grow cursor-pointer py-1 md:h-30">
                  <span className="group-hover:text-primary md:hidden">
                    More
                  </span>
                  <div className="event invisible absolute left-2 z-99 mb-1 flex w-[300%] flex-col rounded-r-[5px] border-l-[3px] border-primary bg-gray-2 px-3 py-1 text-left opacity-0 group-hover:visible group-hover:opacity-100 md:visible md:w-[290%] md:opacity-100">
                    <span className="event-name font-medium text-dark">
                      App Design
                    </span>
                    <span className="time text-sm">25 Dec - 27 Dec</span>
                  </div>
                </div>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">26</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">27</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">28</span>
              </td>
            </tr>
            
            {/* Line 5 */}
            <tr className="grid grid-cols-7">
              <td className="ease relative h-20 cursor-pointer rounded-bl-[10px] border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">29</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">30</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark">31</span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark"></span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark"></span>
              </td>
              <td className="ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark"></span>
              </td>
              <td className="ease relative h-20 cursor-pointer rounded-br-[10px] border border-stroke p-2 transition duration-500 hover:bg-gray-2 md:h-25 md:p-6 xl:h-31">
                <span className="font-medium text-dark"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CalendarBox;
