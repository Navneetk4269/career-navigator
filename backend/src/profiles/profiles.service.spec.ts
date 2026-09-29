import { ProfilesService } from './profiles.service';

describe('ProfilesService', () => {
  let service: ProfilesService;

  beforeEach(() => {
    service = new ProfilesService({} as never, {} as never, {} as never);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractGithubUsername', () => {
    const extractUsername = (input: string) => {
      const extract = Reflect.get(
        ProfilesService.prototype,
        'extractGithubUsername',
      ) as (value: string) => string;

      return extract.call({}, input);
    };

    it.each([
      ['octocat', 'octocat'],
      ['@octocat', 'octocat'],
      ['github.com/octocat', 'octocat'],
      ['https://github.com/octocat/hello-world', 'octocat'],
      ['https://example.com/octocat', ''],
    ])('parses %s as %s', (input, expected) => {
      expect(extractUsername(input)).toBe(expected);
    });
  });
});
