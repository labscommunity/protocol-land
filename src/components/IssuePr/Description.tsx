import { Menu, Transition } from '@headlessui/react'
import MDEditor from '@uiw/react-md-editor'
import { formatDistanceToNow } from 'date-fns'
import React, { Fragment, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { shortenAddress } from '@/helpers/shortenAddress'
import { useGlobalStore } from '@/stores/globalStore'
import { Issue, PullRequest } from '@/types/repository'

export default function Description({ issueOrPr }: { issueOrPr: Issue | PullRequest }) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSubmittingDescription, setIsSubmittingDescription] = React.useState(false)
  const [description, setDescription] = React.useState('')
  const [isContributor, updateIssueDetails, updatePullRequestDetails] = useGlobalStore((state) => [
    state.repoCoreActions.isContributor,
    state.issuesActions.updateIssueDetails,
    state.pullRequestActions.updatePullRequestDetails
  ])
  const navigate = useNavigate()
  const contributor = isContributor()
  const isIssue = 'assignees' in issueOrPr

  async function handleUpdateDescription() {
    if (issueOrPr) {
      setIsSubmittingDescription(true)

      if (issueOrPr.description !== description) {
        if (isIssue) {
          await updateIssueDetails(issueOrPr?.id, { description })
        } else {
          await updatePullRequestDetails(issueOrPr?.id, { description })
        }
      }

      setIsSubmittingDescription(false)
      setIsEditing(false)
    }
  }

  function handleOnCancelDescription() {
    setIsEditing(false)
  }

  useEffect(() => {
    if (issueOrPr?.description) {
      setDescription(issueOrPr.description)
    }
  }, [issueOrPr?.description])

  if (!issueOrPr) return null

  return (
    <div className="flex flex-col border-gray-300 border-[1px] w-full rounded-lg bg-white overflow-hidden">
      <div
        className={`flex justify-between items-center gap-3 bg-gray-200 text-gray-900 px-4 py-2 border-b-[1px] border-gray-300`}
      >
        {isIssue ? (
          <div className="flex flex-auto justify-between">
            <span
              className="hover:underline hover:text-primary-700 cursor-pointer font-medium"
              onClick={() => navigate(`/user/${issueOrPr.author}`)}
            >
              {shortenAddress(issueOrPr.author)}
            </span>
            <span> {formatDistanceToNow(new Date(issueOrPr.timestamp), { addSuffix: true })}</span>
          </div>
        ) : (
          <div className="font-medium">Description</div>
        )}
        {contributor && (
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex gap-[2px] w-full justify-center items-center rounded-md px-4 text-sm font-black">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                <div className="px-1 py-1 ">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-primary-4 bg-primary-500 text-white' : 'text-gray-900'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
      <div className="text-gray-900 p-2 bg-white overflow-auto h-full">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <MDEditor preview="edit" value={description} onChange={(value) => setDescription(value!)} />
            <div className="flex gap-2 justify-end">
              <Button className="h-8" variant="secondary" onClick={handleOnCancelDescription}>
                Cancel
              </Button>
              <Button
                className="h-8"
                variant="primary-outline"
                onClick={handleUpdateDescription}
                isLoading={isSubmittingDescription}
                disabled={isSubmittingDescription}
              >
                Update
              </Button>
            </div>
          </div>
        ) : (
          <MDEditor.Markdown
            className="p-2"
            source={issueOrPr?.description || '<i style="color: #656D76;">No description provided.</i>'}
          />
        )}
      </div>
    </div>
  )
}
