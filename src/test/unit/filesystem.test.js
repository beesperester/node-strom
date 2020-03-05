// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'

describe('tests strom.lib.filesystem module', function () {
  const adapter = strom.lib.filesystem.adapter({})
  const filesystem = strom.lib.filesystem.createFilesystem(adapter)

  describe('tests modifiers', function() {
    it('succeeds to write', function() {
      const received = filesystem.write('path/to/file.txt')('hello world')
      const expected = {
        path: {
          to: {
            'file.txt': 'hello world'
          }
        }
      }

      expect(received).to.deep.equal(expected)
    })

    it('succeeds to read', function() {
      const received = filesystem.read('path/to/file.txt')
      const expected = 'hello world'

      expect(received).to.equal(expected)
    })

    it('succeeds to remove', function() {
      const received = filesystem.remove('path/to/file.txt')
      const expected = {
        path: {
          to: {}
        }
      }

      expect(received).to.deep.equal(expected)
    })

    it('succeeds to mkdir', function() {
      const received = filesystem.mkdir('path/to/some/dir')
      const expected = {
        path: {
          to: {
            some: {
              dir: {}
            }
          }
        }
      }

      expect(received).to.deep.equal(expected)
    })

    it('succeeds to lsdir', function() {
      const received = filesystem.lsdir('path/to/some')
      const expected = ['dir']

      expect(received).to.deep.equal(expected)
    })

    it('succeeds to rmdir', function() {
      const received = filesystem.rmdir('path/to')
      const expected = {
        path: {}
      }

      expect(received).to.deep.equal(expected)
    })
  })
})
