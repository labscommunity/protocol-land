import { Dialog, Transition } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { Fragment } from 'react'
import toast from 'react-hot-toast'
import SVG from 'react-inlinesvg'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'
import CostEstimatesToolTip from '@/components/CostEstimatesToolTip'
import { type Commit, type File, getDeploymentBranchFiles, hasIndexFile, uploadFiles } from '@/lib/dragondeploy'
import { useGlobalStore } from '@/stores/globalStore'
import { Deployment } from '@/types/repository'

export default function DragonDeploy() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(true)
  const [files, setFiles] = useState<File[]>([])
  const [commit, setCommit] = useState<Commit>()
  const [deployedTxId, setDeployedTxId] = useState('')
  const [currentDeployment, setCurrentDeployment] = useState<Deployment>()
  const [currentBranch, selectedRepo, branchState, branchActions, addDeployment] = useGlobalStore((state) => [
    state.branchState.currentBranch,
    state.repoCoreState.selectedRepo.repo,
    state.branchState,
    state.branchActions,
    state.repoCoreActions.addDeployment
  ])

  function closeModal() {
    setIsOpen(false)
  }

  async function deploy() {
    if (selectedRepo && commit && files.length > 0) {
      setIsDeploying(true)
      if (!hasIndexFile(files)) {
        toast.error("No 'index.html' file found.")
        setIsDeploying(false)
        return
      }
      const response = await uploadFiles(files, commit, selectedRepo)
      setDeployedTxId(response.id)
      await addDeployment({
        txId: response.id,
        commitMessage: commit.message,
        commitOid: commit.oid
      })
      toast.success('Deployed successfully')
      setIsDeploying(false)
    }
  }

  useEffect(() => {
    if (branchState.branchList.length === 0) {
      branchActions.listBranches()
    }
  }, [branchState])

  useEffect(() => {
    if (selectedRepo && isOpen) {
      ;(async () => {
        setIsProcessing(true)
        const { files: branchFiles, commit: latestCommit } = await getDeploymentBranchFiles(selectedRepo, currentBranch)
        const deployment = selectedRepo.deployments.find((deployment) => deployment.commitOid === latestCommit.oid)
        setFiles(branchFiles)
        setCommit(latestCommit)
        setCurrentDeployment(deployment)
        setDeployedTxId(deployment?.txId ?? '')
        setIsProcessing(false)
      })()
    }
  }, [selectedRepo?.deploymentBranch, isOpen])

  if (selectedRepo?.deploymentBranch === '') return <></>

  return (
    <>
      <Button variant="primary-solid" onClick={() => setIsOpen(true)}>
        Dragon Deploy
      </Button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-[368px] transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="w-full flex justify-between align-middle">
                    <Dialog.Title as="h3" className="text-xl font-medium text-gray-900">
                      Dragon Deploy
                    </Dialog.Title>
                    <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
                  </div>
                  <Dialog.Description className="mt-4">
                    <div className="flex flex-col text-md gap-2">
                      <div>
                        {currentDeployment
                          ? `The latest commit from deployment branch (${selectedRepo?.deploymentBranch}) is already deployed.`
                          : `The latest commit from deployment branch (${selectedRepo?.deploymentBranch}) is not deployed yet.`}
                      </div>
                      {deployedTxId && (
                        <div className="flex gap-1">
                          <span>Deployed Link:</span>
                          <a
                            className="hover:underline text-primary-700"
                            href={`https://ar-io.net/${deployedTxId}`}
                            target="_blank"
                          >
                            Here
                          </a>
                        </div>
                      )}
                    </div>
                    {!currentDeployment && (
                      <div className="mt-6 flex flex-col gap-2.5">
                        <div className="py-1">
                          <CostEstimatesToolTip fileSizes={files.map((file) => file.size)} />
                        </div>
                      </div>
                    )}
                    <div className="mt-6">
                      <Button
                        isLoading={isDeploying}
                        disabled={isDeploying || isProcessing || !!currentDeployment}
                        className="w-full justify-center font-medium"
                        onClick={deploy}
                        loadingText="Deploying"
                        variant="primary-solid"
                      >
                        Deploy
                      </Button>
                    </div>
                  </Dialog.Description>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
