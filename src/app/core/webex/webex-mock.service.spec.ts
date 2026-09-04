import { TestBed } from '@angular/core/testing';
import { WebexMockService } from './webex-mock.service';
import { WebexEvent } from './webex.models';

describe('WebexMockService', () => {
  let service: WebexMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebexMockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize correctly', async () => {
    expect(service.isWebexAvailable()).toBeFalse();
    await service.init();
    expect(service.isWebexAvailable()).toBeTrue();
  });

  it('should return mock environment', () => {
    expect(service.getEnvironment()).toBe('mock');
  });

  it('should return mock user after init', async () => {
    await service.init();
    const user = await service.getUser();
    expect(user).toBeTruthy();
    expect(user?.id).toBe('mock-user-001');
  });

  it('should return mock space after init', async () => {
    await service.init();
    const space = await service.getSpace();
    expect(space).toBeTruthy();
    expect(space?.type).toBe('group');
  });

  it('should return mock meeting after init', async () => {
    await service.init();
    const meeting = await service.getMeeting();
    expect(meeting).toBeTruthy();
    expect(meeting?.status).toBe('active');
  });

  it('should return combined context after init', async () => {
    await service.init();
    const context = await service.getContext();
    expect(context.environment).toBe('mock');
    expect(context.user?.displayName).toBe('Fatih Has');
  });

  it('should emit themeChanged event', (done) => {
    service.on('themeChanged', (payload) => {
      expect(payload).toBe('light');
      done();
    });
    service.simulateEvent('themeChanged', 'light');
  });

  it('should emit meetingStarted event', (done) => {
    service.on('meetingStarted', () => {
      expect(true).toBeTrue();
      done();
    });
    service.simulateMeetingStart();
  });

  it('should emit meetingEnded event and clear meeting', async (done) => {
    await service.init();
    service.on('meetingEnded', async () => {
      const meeting = await service.getMeeting();
      expect(meeting).toBeNull();
      done();
    });
    service.simulateMeetingEnd();
  });

  it('should throw error if methods called before init', async () => {
    try {
      await service.getUser();
      fail('Should have thrown error');
    } catch (e: any) {
      expect(e.message).toBe('Webex SDK is not initialized yet.');
    }
  });
});
