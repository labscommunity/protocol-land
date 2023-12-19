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
  const [uploadPercent, setUploadPercent] = useState(0)
  const [branchToRestore, setBranchToRestore] = useState('')
  const [currentBranch, selectedRepo, branchState, branchActions, addDeployment] = useGlobalStore((state) => [
    state.branchState.currentBranch,
    state.repoCoreState.selectedRepo.repo,
    state.branchState,
    state.branchActions,
    state.repoCoreActions.addDeployment
  ])

  useEffect(() => {
    if (branchState.branchList.length === 0) {
      branchActions.listBranches()
    }
  }, [branchState])

  useEffect(() => {
    loadFilesForDeployment()
  }, [selectedRepo?.deploymentBranch, isOpen])

  function closeModal() {
    setIsOpen(false)
  }

  async function loadFilesForDeployment() {
    if (selectedRepo && isOpen) {
      setIsProcessing(true)
      setBranchToRestore('')
      try {
        const {
          files: branchFiles,
          commit: latestCommit,
          branchToRestore: branchToRestoreName
        } = await getDeploymentBranchFiles(selectedRepo, currentBranch)
        const deployment = selectedRepo.deployments.find((deployment) => deployment.commitOid === latestCommit.oid)
        setFiles(branchFiles)
        setCommit(latestCommit)
        setCurrentDeployment(deployment)
        setDeployedTxId(deployment?.txId ?? '')
        setBranchToRestore(branchToRestoreName)
        setIsProcessing(false)
      } catch (error) {
        toast.error((error as any).message)
      }
    }
  }

  async function deploy() {
    if (selectedRepo && commit && files.length > 0) {
      setIsDeploying(true)
      if (!hasIndexFile(files)) {
        toast.error("No 'index.html' file found.")
        setIsDeploying(false)
        return
      }

      setUploadPercent(0)
      try {
        const response = await uploadFiles(files, commit, selectedRepo, branchToRestore, setUploadPercent)
        const deployment = await addDeployment({
          txId: response.id,
          commitMessage: commit.message,
          commitOid: commit.oid
        })
        setCurrentDeployment(deployment)
        setDeployedTxId(response.id)
        toast.success('Deployed successfully')
      } catch (err) {
        toast.error('Deploy failed')
      }
      setIsDeploying(false)
    }
  }

  if (selectedRepo?.deploymentBranch === '') return null

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
                        {`The latest commit from deployment branch (${selectedRepo?.deploymentBranch}) is ${
                          currentDeployment ? 'deployed' : 'not deployed yet'
                        }.`}
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
                    <div className="flex flex-col gap-3 mt-2">
                      {isDeploying && (
                        <div className="w-full bg-gray-200 rounded-full">
                          <div
                            className="bg-primary-600 text-xs font-medium text-primary-100 text-center p-0.5 leading-none rounded-full"
                            style={{ width: `${uploadPercent}%` }}
                          >
                            {uploadPercent}%
                          </div>
                        </div>
                      )}

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
