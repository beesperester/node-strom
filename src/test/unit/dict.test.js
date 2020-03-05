// Test related imports.
import 'chai/register-expect'
import { expect } from 'chai'
import { describe, it } from 'mocha'

import strom from '../../index'

describe('tests strom.lib.dict module', function () {
	describe('tests deflate', function() {
		it('succeeds with expected arguments', function() {
			const received = strom.lib.dict.deflate({
				path: {
					to: {
						some: {
							leaf: 'hello'
						},
						another: {
							leaf: 'world'
						}
					}
				}
			})('')
			const expected = {
				'path/to/some/leaf': 'hello',
				'path/to/another/leaf': 'world'
			}

			expect(received).to.deep.equal(expected)
		})
	})

	describe('tests inflate', function() {
		it('succeeds with expected arguments', function () {
			const received = strom.lib.dict.inflate({
				'path/to/some/leaf': 'hello',
				'path/to/another/leaf': 'world'
			})
			const expected = {
				path: {
					to: {
						some: {
							leaf: 'hello'
						},
						another: {
							leaf: 'world'
						}
					}
				}
			}

			expect(received).to.deep.equal(expected)
		})
	})

  describe('tests modifiers', function() {
    it('succeeds to addLeaf', function() {
      const dict = {
        some: {
          path: {
            to: {
              leaf: 'hello world'
            }
          }
        }
      }
      const received = strom.lib.dict.addLeaf(dict)('some/path/to/some/file.txt')('foobar')
      const expected = {
        some: {
          path: {
            to: {
              leaf: 'hello world',
              some: {
                'file.txt': 'foobar'
              }
            }
          }
        }
      }

      expect(received).to.deep.equal(expected)
    })

    it('succeeds to getLeaf', function() {
      const dict = {
        some: {
          path: {
            to: {
              leaf: 'hello world'
            }
          }
        }
      }
      const received = strom.lib.dict.getLeaf(dict)('some/path/to/leaf')
      const expected = 'hello world'

      expect(received).to.equal(expected)
    })

    it('succeeds to removeLeaf', function() {
      const dict = {
        some: {
          path: {
            to: {
              leaf: 'hello world'
            }
          }
        }
      }
      const received = strom.lib.dict.removeLeaf(dict)('some/path/to/leaf')
      const expected = {
        some: {
          path: {
            to: {}
          }
        }
      }

      expect(received).to.deep.equal(expected)
    })
  })
})
