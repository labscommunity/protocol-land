import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { FiExternalLink } from 'react-icons/fi'
import { GrDeploy } from 'react-icons/gr'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { useGlobalStore } from '@/stores/globalStore'

export default function DeploymentsTab() {
  const navigate = useNavigate()
  const [userRepo] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo])
  const deployments = [...(userRepo?.deployments ?? [])].reverse()

  function gotoUser(userAddress: string) {
    if (userAddress) {
      navigate(`/user/${userAddress}`)
    }
  }

  if (deployments.length === 0) {
    return (
      <div className="h-full w-full px-2 flex flex-col">
        <div className="flex flex-col w-full border-gray-300 border-[1px] rounded-lg bg-white overflow-hidden">
          <div className="rounded-t-lg flex justify-between bg-gray-200 border-b-[1px] border-gray-300 items-center gap-2 py-2 px-4 h-12"></div>

          <div className="rounded-b-lg w-full bg-white text-liberty-dark-100 overflow-hidden">
            <div className="flex flex-col gap-2 h-32 w-full items-center justify-center">
              <GrDeploy className="h-7 w-7" />
              <h1 className="text-lg font-medium">Looks like this repository has no previous deployments.</h1>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full px-2 flex flex-col">
      <div className="flex flex-col w-full border-gray-300 border-[1px] rounded-lg bg-white overflow-hidden">
        <div className="rounded-t-lg flex justify-between bg-gray-200 border-b-[1px] border-gray-300 items-center gap-2 py-2 px-4 h-12 font-medium">
          {deployments.length} deployments
        </div>

        <div className="rounded-b-lg w-full bg-white text-liberty-dark-100 overflow-hidden">
          {deployments.map((deployment) => (
            <div
              id={deployment.txId}
              className="flex bg-gray-50 hover:bg-primary-50 text-gray-600 hover:text-gray-900 items-center gap-4 py-[10px] px-4 border-b-[1px] border-gray-300 last:border-b-0"
            >
              <div className="flex w-full justify-between items-center">
                <div className="flex gap-2 w-[70%]">
                  <div className="mt-1">
                    <IoIosCheckmarkCircle className="text-green-700 w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span>{deployment.commitMessage}</span>
                    <div className="flex gap-1 text-gray-500 text-sm ">
                      <span className="">Deployed by</span>
                      <span
                        className="hover:text-primary-700 cursor-pointer"
                        onClick={() => gotoUser(deployment.deployedBy)}
                      >
                        {shortenAddress(deployment.deployedBy)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-between w-[30%]">
                  <div>
                    <span className="bg-primary-200 rounded-md p-1 text-sm text-primary-700">{deployment.branch}</span>
                  </div>
                  <div className="flex gap-2">
                    <span>{formatDistanceToNow(new Date(deployment.timestamp), { addSuffix: true })}</span>
                    <a className="hover:text-primary-700" href={`https://ar-io.net/${deployment.txId}`} target="_blank">
                      <FiExternalLink className="cursor-pointer mt-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
